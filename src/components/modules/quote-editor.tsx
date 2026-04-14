"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { calculateQuoteScenario } from "@/modules/cotizador/domain/calculate-quote";
import type { QuoteItemInput, QuoteScenarioInput } from "@/modules/cotizador/domain/types";
import { formatCurrency, formatPercentage, toNumber } from "@/lib/utils";

function emptyQuoteItem(nextLineNumber: number, sellerName?: string): QuoteItemInput {
  return {
    lineNumber: nextLineNumber,
    status: "COTIZACION",
    sellerName: sellerName ?? "PABLO",
    quantity: 1,
    partNumber: "",
    description: "",
    productTypeKey: "SFP",
    fobUnitCost: 0,
    weightKg: 0,
    lineMarkup: 1.47
  };
}

export function QuoteEditor({
  initialScenario,
  scenarioId
}: {
  initialScenario: QuoteScenarioInput;
  scenarioId?: string;
}) {
  const router = useRouter();
  const [scenario, setScenario] = useState(initialScenario);
  const [persistedScenarioId, setPersistedScenarioId] = useState(scenarioId);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const results = useMemo(() => calculateQuoteScenario(scenario), [scenario]);

  function updateItem(index: number, patch: Partial<QuoteItemInput>) {
    setScenario((current) => {
      const items = current.items.slice();
      items[index] = { ...items[index], ...patch };
      return { ...current, items };
    });
  }

  function addItem() {
    setScenario((current) => ({
      ...current,
      items: [...current.items, emptyQuoteItem(current.items.length + 1, current.items[0]?.sellerName ?? "PABLO")]
    }));
  }

  function removeItem(index: number) {
    setScenario((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({
        ...item,
        lineNumber: itemIndex + 1
      }))
    }));
  }

  function saveScenario() {
    startTransition(async () => {
      const response = await fetch(
        persistedScenarioId ? `/api/quote-scenarios/${persistedScenarioId}` : "/api/quote-scenarios",
        {
          method: persistedScenarioId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scenario)
        }
      );

      const payload = await response
        .json()
        .catch(() => ({ error: "No se pudo guardar.", id: undefined as string | undefined }));

      if (!response.ok) {
        setMessage(payload.error ?? "No se pudo guardar.");
        return;
      }

      if (!persistedScenarioId && payload.id) {
        setPersistedScenarioId(payload.id);
        router.refresh();
      }

      setMessage("Cotizacion guardada correctamente.");
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
            <h1 className="mt-2 text-3xl font-semibold">Cotizador</h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Replica estructurada del `COTIZADOR ACTUAL`, con formulas desacopladas y trazabilidad por linea.
            </p>
          </div>
          <button
            onClick={saveScenario}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--brand)] px-4 py-3 font-medium text-white"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Guardando..." : "Guardar escenario"}
          </button>
        </div>
        {message ? <div className="mt-4 text-sm text-[color:var(--brand)]">{message}</div> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <label className="rounded-[22px] border border-[var(--line)] bg-white p-4">
          <span className="text-sm font-medium">Nombre</span>
          <input
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            value={scenario.name}
            onChange={(event) => setScenario({ ...scenario, name: event.target.value })}
          />
        </label>
        <label className="rounded-[22px] border border-[var(--line)] bg-white p-4">
          <span className="text-sm font-medium">Markup global</span>
          <input
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            type="number"
            step="0.01"
            value={scenario.globalMarkupFactor}
            onChange={(event) => setScenario({ ...scenario, globalMarkupFactor: toNumber(event.target.value) })}
          />
        </label>
        <label className="rounded-[22px] border border-[var(--line)] bg-white p-4">
          <span className="text-sm font-medium">Seguro</span>
          <input
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            type="number"
            step="0.001"
            value={scenario.insuranceRate}
            onChange={(event) => setScenario({ ...scenario, insuranceRate: toNumber(event.target.value) })}
          />
        </label>
        <label className="rounded-[22px] border border-[var(--line)] bg-white p-4">
          <span className="text-sm font-medium">Impuesto pais</span>
          <input
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            type="number"
            step="0.001"
            value={scenario.countryTaxRate}
            onChange={(event) => setScenario({ ...scenario, countryTaxRate: toNumber(event.target.value) })}
          />
        </label>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Items</h2>
          <button onClick={addItem} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] px-4 py-2">
            <Plus className="h-4 w-4" />
            Agregar linea
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] text-sm">
            <thead className="text-left text-[color:var(--muted)]">
              <tr>
                {["#", "Status", "Vendedor", "Cantidad", "Part number", "Descripcion", "Tipo", "FOB", "Peso", "Markup", "Acciones"].map((header) => (
                  <th key={header} className="px-2 py-2">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenario.items.map((item, index) => (
                <tr key={item.lineNumber} className="border-t border-[var(--line)]">
                  <td className="px-2 py-2">{item.lineNumber}</td>
                  <td className="px-2 py-2">
                    <select
                      className="rounded-xl border border-[var(--line)] px-2 py-2"
                      value={item.status}
                      onChange={(event) => updateItem(index, { status: event.target.value as QuoteItemInput["status"] })}
                    >
                      <option value="COTIZACION">COTIZACION</option>
                      <option value="COMPRAS">COMPRAS</option>
                      <option value="VENCIDO">VENCIDO</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input className="rounded-xl border border-[var(--line)] px-2 py-2" value={item.sellerName ?? ""} onChange={(event) => updateItem(index, { sellerName: event.target.value })} />
                  </td>
                  <td className="px-2 py-2">
                    <input className="w-24 rounded-xl border border-[var(--line)] px-2 py-2" type="number" value={item.quantity} onChange={(event) => updateItem(index, { quantity: toNumber(event.target.value) })} />
                  </td>
                  <td className="px-2 py-2">
                    <input className="rounded-xl border border-[var(--line)] px-2 py-2" value={item.partNumber} onChange={(event) => updateItem(index, { partNumber: event.target.value })} />
                  </td>
                  <td className="px-2 py-2">
                    <input className="min-w-72 rounded-xl border border-[var(--line)] px-2 py-2" value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} />
                  </td>
                  <td className="px-2 py-2">
                    <select className="min-w-56 rounded-xl border border-[var(--line)] px-2 py-2" value={item.productTypeKey} onChange={(event) => updateItem(index, { productTypeKey: event.target.value })}>
                      {scenario.productRules.map((rule) => (
                        <option key={rule.productTypeKey} value={rule.productTypeKey}>
                          {rule.productTypeKey}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input className="w-28 rounded-xl border border-[var(--line)] px-2 py-2" type="number" step="0.01" value={item.fobUnitCost} onChange={(event) => updateItem(index, { fobUnitCost: toNumber(event.target.value) })} />
                  </td>
                  <td className="px-2 py-2">
                    <input className="w-24 rounded-xl border border-[var(--line)] px-2 py-2" type="number" step="0.01" value={item.weightKg} onChange={(event) => updateItem(index, { weightKg: toNumber(event.target.value) })} />
                  </td>
                  <td className="px-2 py-2">
                    <input className="w-24 rounded-xl border border-[var(--line)] px-2 py-2" type="number" step="0.01" value={item.lineMarkup} onChange={(event) => updateItem(index, { lineMarkup: toNumber(event.target.value) })} />
                  </td>
                  <td className="px-2 py-2">
                    <button onClick={() => removeItem(index)} className="rounded-xl border border-[var(--line)] p-2 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">FOB total cotizacion</div>
          <div className="mt-2 text-3xl font-semibold">{formatCurrency(results.totals.fobTotal)}</div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Costo origen</div>
          <div className="mt-2 text-3xl font-semibold">{formatCurrency(results.totals.originTotal)}</div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Venta total</div>
          <div className="mt-2 text-3xl font-semibold">{formatCurrency(results.totals.salesTotal)}</div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Desglose por linea activa</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[1100px] text-sm">
            <thead className="text-left text-[color:var(--muted)]">
              <tr>
                {["Linea", "Tipo", "Share valor", "Share peso", "CIF/CIP", "Derechos", "IVA", "Gastos destino", "Costo unitario", "Venta unit.", "Venta total"].map((header) => (
                  <th key={header} className="px-2 py-2">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.activeQuoteItems.map((line) => (
                <tr key={line.input.lineNumber} className="border-t border-[var(--line)]">
                  <td className="px-2 py-2">{line.input.lineNumber}</td>
                  <td className="px-2 py-2">{line.input.productTypeKey}</td>
                  <td className="px-2 py-2">{formatPercentage(line.valueShare)}</td>
                  <td className="px-2 py-2">{formatPercentage(line.weightShare)}</td>
                  <td className="px-2 py-2">{formatCurrency(line.cifCip)}</td>
                  <td className="px-2 py-2">{formatCurrency(line.duties)}</td>
                  <td className="px-2 py-2">{formatCurrency(line.vat)}</td>
                  <td className="px-2 py-2">{formatCurrency(line.destinationExpenses)}</td>
                  <td className="px-2 py-2">{formatCurrency(line.landedUnitCost)}</td>
                  <td className="px-2 py-2">{formatCurrency(line.salesUnitPrice)}</td>
                  <td className="px-2 py-2">{formatCurrency(line.salesTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
