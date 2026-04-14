"use client";

import { useMemo, useState, useTransition } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { PercentageInput } from "@/components/inputs/percentage-input";
import { calculateBreakEvenScenario } from "@/modules/break-even/domain/calculate-break-even";
import type { BreakEvenScenarioInput } from "@/modules/break-even/domain/types";
import { formatCurrency, formatPercentage, toNumber } from "@/lib/utils";

export function BreakEvenEditor({
  initialScenario,
  scenarioId
}: {
  initialScenario: BreakEvenScenarioInput;
  scenarioId?: string;
}) {
  const router = useRouter();
  const [scenario, setScenario] = useState(initialScenario);
  const [persistedScenarioId, setPersistedScenarioId] = useState(scenarioId);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const result = useMemo(() => calculateBreakEvenScenario(scenario), [scenario]);

  function saveScenario() {
    startTransition(async () => {
      const response = await fetch(
        persistedScenarioId
          ? `/api/break-even-scenarios/${persistedScenarioId}`
          : "/api/break-even-scenarios",
        {
          method: persistedScenarioId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scenario)
        }
      );

      const payload = await response
        .json()
        .catch(() => ({ error: "No se pudo guardar el escenario.", id: undefined as string | undefined }));

      if (!response.ok) {
        setMessage(payload.error ?? "No se pudo guardar el escenario.");
        return;
      }

      if (!persistedScenarioId && payload.id) {
        setPersistedScenarioId(payload.id);
        router.refresh();
      }

      setMessage("Escenario guardado correctamente.");
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
            <h1 className="mt-2 text-3xl font-semibold">Punto de equilibrio</h1>
            <p className="mt-2 max-w-3xl text-sm text-[color:var(--muted)]">
              Version enfocada en separar gastos fijos de gastos variables y medir el
              punto de equilibrio sobre la facturacion analizada.
            </p>
          </div>
          <button
            onClick={saveScenario}
            className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--brand)] px-4 py-3 font-medium text-white"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Guardando..." : "Guardar escenario"}
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
          ["Facturacion", "salesAmount"],
          ["Markup", "markup"],
          ["TC", "exchangeRate"]
        ].map(([label, key]) => (
          <label key={key} className="rounded-[22px] border border-[var(--line)] bg-white p-4">
            <span className="text-sm font-medium">{label}</span>
            <input
              className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
              type="number"
              step="0.01"
              value={scenario[key as keyof BreakEvenScenarioInput] as number}
              onChange={(event) =>
                setScenario({ ...scenario, [key]: toNumber(event.target.value) })
              }
            />
          </label>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Margen de contribucion</div>
          <div className="mt-2 text-3xl font-semibold">{formatPercentage(result.contributionMarginRate)}</div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Gastos variables</div>
          <div className="mt-2 text-3xl font-semibold">{formatCurrency(result.totalVariableCosts, "ARS")}</div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Gastos fijos</div>
          <div className="mt-2 text-3xl font-semibold">{formatCurrency(result.totalFixedCosts, "ARS")}</div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">PE</div>
          <div className="mt-2 text-3xl font-semibold">{formatCurrency(result.breakEvenPesos, "ARS")}</div>
          <div className="mt-1 text-sm text-[color:var(--muted)]">{formatCurrency(result.breakEvenUsd)}</div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Gastos fijos</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
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
        </div>

        <div className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Gastos variables</h2>
          <div className="mt-4 space-y-3">
            {scenario.variableCosts.map((line, index) => (
              <div
                key={line.lineKey}
                className="grid gap-3 rounded-2xl border border-[var(--line)] p-4 md:grid-cols-[1.2fr_140px_180px]"
              >
                <div>
                  <div className="font-medium">{line.label}</div>
                  <div className="text-sm text-[color:var(--muted)]">
                    Se calcula sobre la facturacion del escenario.
                  </div>
                </div>
                <PercentageInput
                  value={line.rate}
                  onValueChange={(rate) =>
                    setScenario((current) => {
                      const variableCosts = current.variableCosts.slice();
                      variableCosts[index] = { ...line, rate };
                      return { ...current, variableCosts };
                    })
                  }
                />
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  {formatCurrency(result.variableCostLines[index]?.computedAmount ?? 0, "ARS")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-[color:var(--muted)]">
              <tr>
                {["Concepto", "ARS", "USD / %"].map((header) => (
                  <th key={header} className="px-2 py-2">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--line)]">
                <td className="px-2 py-2">CMV</td>
                <td className="px-2 py-2">{formatCurrency(result.costOfGoodsSold, "ARS")}</td>
                <td className="px-2 py-2">{formatCurrency(result.costOfGoodsSold / Math.max(scenario.exchangeRate, 1))}</td>
              </tr>
              <tr className="border-t border-[var(--line)]">
                <td className="px-2 py-2">Utilidad bruta</td>
                <td className="px-2 py-2">{formatCurrency(result.grossProfit, "ARS")}</td>
                <td className="px-2 py-2">{formatCurrency(result.grossProfit / Math.max(scenario.exchangeRate, 1))}</td>
              </tr>
              <tr className="border-t border-[var(--line)]">
                <td className="px-2 py-2">Margen de contribucion</td>
                <td className="px-2 py-2">{formatCurrency(result.contributionMarginAmount, "ARS")}</td>
                <td className="px-2 py-2">{formatPercentage(result.contributionMarginRate)}</td>
              </tr>
              <tr className="border-t border-[var(--line)]">
                <td className="px-2 py-2">Resultado operativo actual</td>
                <td className="px-2 py-2">{formatCurrency(result.operatingResult, "ARS")}</td>
                <td className="px-2 py-2">{formatCurrency(result.operatingResult / Math.max(scenario.exchangeRate, 1))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
