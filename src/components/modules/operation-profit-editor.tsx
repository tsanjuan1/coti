"use client";

import { useMemo, useState, useTransition } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { calculateOperationProfit } from "@/modules/operation-profit/domain/calculate-operation-profit";
import type { OperationProfitScenarioInput } from "@/modules/operation-profit/domain/types";
import { formatCurrency, formatPercentage, toNumber } from "@/lib/utils";

export function OperationProfitEditor({
  initialScenario,
  scenarioId
}: {
  initialScenario: OperationProfitScenarioInput;
  scenarioId?: string;
}) {
  const router = useRouter();
  const [scenario, setScenario] = useState(initialScenario);
  const [persistedScenarioId, setPersistedScenarioId] = useState(scenarioId);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const result = useMemo(() => calculateOperationProfit(scenario), [scenario]);

  function saveScenario() {
    startTransition(async () => {
      const response = await fetch(
        persistedScenarioId
          ? `/api/operation-profit-scenarios/${persistedScenarioId}`
          : "/api/operation-profit-scenarios",
        {
          method: persistedScenarioId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scenario)
        }
      );

      const payload = await response
        .json()
        .catch(() => ({ error: "No se pudo guardar la operacion.", id: undefined as string | undefined }));

      if (!response.ok) {
        setMessage(payload.error ?? "No se pudo guardar la operacion.");
        return;
      }

      if (!persistedScenarioId && payload.id) {
        setPersistedScenarioId(payload.id);
        router.refresh();
      }

      setMessage("Operacion guardada correctamente.");
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Modulo
            </div>
            <h1 className="mt-2 text-3xl font-semibold">Utilidad por operacion</h1>
          </div>
          <button onClick={saveScenario} className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--brand)] px-4 py-3 font-medium text-white">
            <Save className="h-4 w-4" />
            {isPending ? "Guardando..." : "Guardar operacion"}
          </button>
        </div>
        {message ? <div className="mt-4 text-sm text-[color:var(--brand)]">{message}</div> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <label className="rounded-[22px] border border-[var(--line)] bg-white p-4">
          <span className="text-sm font-medium">Nombre</span>
          <input
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            value={scenario.name}
            onChange={(event) => setScenario({ ...scenario, name: event.target.value })}
          />
        </label>
        {[
          ["Facturacion", "billingAmount"],
          ["Markup", "markup"],
          ["TC", "exchangeRate"]
        ].map(([label, key]) => (
          <label key={key} className="rounded-[22px] border border-[var(--line)] bg-white p-4">
            <span className="text-sm font-medium">{label}</span>
            <input
              className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
              type="number"
              step="0.01"
              value={scenario[key as keyof OperationProfitScenarioInput] as number}
              onChange={(event) => setScenario({ ...scenario, [key]: toNumber(event.target.value) })}
            />
          </label>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">CMV</div>
          <div className="mt-2 text-3xl font-semibold">{formatCurrency(result.costOfGoodsSold, "ARS")}</div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Utilidad bruta</div>
          <div className="mt-2 text-3xl font-semibold">{formatCurrency(result.grossProfit, "ARS")}</div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Margen contribucion</div>
          <div className="mt-2 text-3xl font-semibold">{formatPercentage(result.contributionMarginRate)}</div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Resultado operativo</div>
          <div className="mt-2 text-3xl font-semibold">{formatCurrency(result.operatingResult, "ARS")}</div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Gastos variables</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {scenario.variableCosts.map((line, index) => (
            <label key={line.lineKey} className="rounded-2xl border border-[var(--line)] p-4">
              <span className="block text-sm font-medium">{line.label}</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.0001"
                value={line.rate}
                onChange={(event) =>
                  setScenario((current) => {
                    const variableCosts = current.variableCosts.slice();
                    variableCosts[index] = { ...line, rate: toNumber(event.target.value) };
                    return { ...current, variableCosts };
                  })
                }
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Gastos fijos</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {scenario.fixedCosts.map((line, index) => (
            <label key={line.lineKey} className="rounded-2xl border border-[var(--line)] p-4">
              <span className="block text-sm font-medium">{line.label}</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.01"
                value={line.formulaMode === "manual" ? line.amount ?? 0 : line.inputA ?? 0}
                onChange={(event) =>
                  setScenario((current) => {
                    const fixedCosts = current.fixedCosts.slice();
                    const nextValue = toNumber(event.target.value);
                    fixedCosts[index] =
                      line.formulaMode === "manual"
                        ? { ...line, amount: nextValue }
                        : { ...line, inputA: nextValue };
                    return { ...current, fixedCosts };
                  })
                }
              />
              <div className="mt-2 text-xs text-[color:var(--muted)]">
                Calculado: {formatCurrency(result.fixedCostLines[index]?.computedAmount ?? 0, "ARS")}
              </div>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
