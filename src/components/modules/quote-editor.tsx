"use client";

import { useMemo, useState, useTransition } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { calculateQuoteScenario } from "@/modules/cotizador/domain/calculate-quote";
import type { QuoteScenarioInput } from "@/modules/cotizador/domain/types";
import { formatCurrency, formatPercentage, toNumber } from "@/lib/utils";

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
  const result = useMemo(() => calculateQuoteScenario(scenario), [scenario]);

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
            <h1 className="mt-2 text-3xl font-semibold">Cotizador compacto</h1>
            <p className="mt-2 max-w-3xl text-sm text-[color:var(--muted)]">
              Esta version sigue la variante compacta del Excel: producto, costo proveedor,
              seguro, flete por kilo, tasas del padron y salida en USD/ARS.
            </p>
          </div>
          <button
            onClick={saveScenario}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--brand)] px-4 py-3 font-medium text-white"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Guardando..." : "Guardar cotizacion"}
          </button>
        </div>
        {message ? <div className="mt-4 text-sm text-[color:var(--brand)]">{message}</div> : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="text-sm font-medium">Nombre del escenario</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                value={scenario.name}
                onChange={(event) => setScenario({ ...scenario, name: event.target.value })}
              />
            </label>

            <label className="md:col-span-2">
              <span className="text-sm font-medium">Producto</span>
              <select
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                value={scenario.productTypeKey}
                onChange={(event) => setScenario({ ...scenario, productTypeKey: event.target.value })}
              >
                {scenario.productRules.map((rule) => (
                  <option key={rule.productTypeKey} value={rule.productTypeKey}>
                    {rule.productTypeKey}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-sm font-medium">Precio unitario proveedor</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.01"
                value={scenario.supplierUnitPriceUsd}
                onChange={(event) =>
                  setScenario({ ...scenario, supplierUnitPriceUsd: toNumber(event.target.value) })
                }
              />
              <p className="mt-2 text-xs text-[color:var(--muted)]">
                Nota operativa: si el producto tiene trafo, sumalo en este precio base.
              </p>
            </label>

            <label>
              <span className="text-sm font-medium">Precio</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.01"
                value={scenario.priceFactor}
                onChange={(event) =>
                  setScenario({ ...scenario, priceFactor: toNumber(event.target.value) })
                }
              />
            </label>

            <label>
              <span className="text-sm font-medium">Seguro</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.0001"
                value={scenario.insuranceRate}
                onChange={(event) =>
                  setScenario({ ...scenario, insuranceRate: toNumber(event.target.value) })
                }
              />
            </label>

            <label>
              <span className="text-sm font-medium">Costo flete x kg</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.01"
                value={scenario.freightRatePerKgUsd}
                onChange={(event) =>
                  setScenario({ ...scenario, freightRatePerKgUsd: toNumber(event.target.value) })
                }
              />
            </label>

            <label>
              <span className="text-sm font-medium">Peso facturable kg</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.01"
                value={scenario.freightWeightKg}
                onChange={(event) =>
                  setScenario({ ...scenario, freightWeightKg: toNumber(event.target.value) })
                }
              />
            </label>

            <label>
              <span className="text-sm font-medium">Gastos varios</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.0001"
                value={scenario.miscellaneousRate}
                onChange={(event) =>
                  setScenario({ ...scenario, miscellaneousRate: toNumber(event.target.value) })
                }
              />
            </label>

            <label>
              <span className="text-sm font-medium">Transferencia</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.0001"
                value={scenario.transferRate}
                onChange={(event) =>
                  setScenario({ ...scenario, transferRate: toNumber(event.target.value) })
                }
              />
            </label>

            <label>
              <span className="text-sm font-medium">Imp. pais</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.0001"
                value={scenario.countryTaxRate}
                onChange={(event) =>
                  setScenario({ ...scenario, countryTaxRate: toNumber(event.target.value) })
                }
              />
            </label>

            <label>
              <span className="text-sm font-medium">TC</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.01"
                value={scenario.exchangeRateArsUsd}
                onChange={(event) =>
                  setScenario({ ...scenario, exchangeRateArsUsd: toNumber(event.target.value) })
                }
              />
            </label>

            <label>
              <span className="text-sm font-medium">Venta</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.01"
                value={scenario.saleFactor}
                onChange={(event) =>
                  setScenario({ ...scenario, saleFactor: toNumber(event.target.value) })
                }
              />
            </label>
          </div>
        </div>

        <aside className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Padron arancelario aplicado</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl border border-[var(--line)] bg-slate-50 p-4">
              <div className="font-medium">{scenario.productTypeKey}</div>
              <div className="mt-1 text-[color:var(--muted)]">
                {result.selectedRule?.description || "Sin descripcion adicional"}
              </div>
              <div className="mt-2 text-[color:var(--muted)]">
                NCM: {result.selectedRule?.ncmCode || "No informado"}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line)] p-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span>Derechos</span>
                  <strong>{formatPercentage(result.rates.dutyRate)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estadistica</span>
                  <strong>{formatPercentage(result.rates.statisticsRate)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>IVA</span>
                  <strong>{formatPercentage(result.rates.vatRate)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Imp. interno</span>
                  <strong>{formatPercentage(result.rates.internalTaxRate)}</strong>
                </div>
              </div>
            </div>

            {result.warnings.length > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                {result.warnings.join(" ")}
              </div>
            ) : null}
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">CIF</div>
          <div className="mt-2 text-3xl font-semibold">
            {formatCurrency(result.amounts.cifUsd)}
          </div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Costo total</div>
          <div className="mt-2 text-3xl font-semibold">
            {formatCurrency(result.amounts.totalCostUsd)}
          </div>
          <div className="mt-1 text-sm text-[color:var(--muted)]">
            {formatCurrency(result.amounts.totalCostArs, "ARS")}
          </div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Factura courier</div>
          <div className="mt-2 text-3xl font-semibold">
            {formatCurrency(result.amounts.courierInvoiceUsd)}
          </div>
          <div className="mt-1 text-sm text-[color:var(--muted)]">
            {formatCurrency(result.amounts.courierInvoiceArs, "ARS")}
          </div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Venta</div>
          <div className="mt-2 text-3xl font-semibold">
            {formatCurrency(result.amounts.salePriceUsd)}
          </div>
          <div className="mt-1 text-sm text-[color:var(--muted)]">
            {formatCurrency(result.amounts.salePriceArs, "ARS")}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Desglose del costo</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-[color:var(--muted)]">
              <tr>
                {["Concepto", "Tasa", "USD", "ARS"].map((header) => (
                  <th key={header} className="px-2 py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Precio ajustado", formatPercentage(result.rates.priceFactor - 1), result.amounts.adjustedSupplierPriceUsd, result.amounts.adjustedSupplierPriceUsd * scenario.exchangeRateArsUsd],
                ["Seguro", formatPercentage(scenario.insuranceRate), result.amounts.insuranceUsd, result.amounts.insuranceUsd * scenario.exchangeRateArsUsd],
                ["Flete", "-", result.amounts.freightUsd, result.amounts.freightUsd * scenario.exchangeRateArsUsd],
                ["Derechos", formatPercentage(result.rates.dutyRate), result.amounts.dutiesUsd, result.amounts.dutiesUsd * scenario.exchangeRateArsUsd],
                ["Estadistica", formatPercentage(result.rates.statisticsRate), result.amounts.statisticsUsd, result.amounts.statisticsUsd * scenario.exchangeRateArsUsd],
                ["IVA", formatPercentage(result.rates.vatRate), result.amounts.vatUsd, result.amounts.vatUsd * scenario.exchangeRateArsUsd],
                ["Imp. interno", formatPercentage(result.rates.internalTaxRate), result.amounts.internalTaxUsd, result.amounts.internalTaxUsd * scenario.exchangeRateArsUsd],
                ["Gastos varios", formatPercentage(result.rates.miscellaneousRate), result.amounts.miscellaneousUsd, result.amounts.miscellaneousUsd * scenario.exchangeRateArsUsd],
                ["Transferencia", formatPercentage(result.rates.transferRate), result.amounts.transferUsd, result.amounts.transferUsd * scenario.exchangeRateArsUsd],
                ["Imp. pais", formatPercentage(result.rates.countryTaxRate), result.amounts.countryTaxUsd, result.amounts.countryTaxUsd * scenario.exchangeRateArsUsd]
              ].map(([label, rate, usd, ars]) => (
                <tr key={label as string} className="border-t border-[var(--line)]">
                  <td className="px-2 py-2">{label}</td>
                  <td className="px-2 py-2">{rate}</td>
                  <td className="px-2 py-2">{formatCurrency(usd as number)}</td>
                  <td className="px-2 py-2">{formatCurrency(ars as number, "ARS")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Variacion % en costos</div>
          <div className="mt-2 text-3xl font-semibold">
            {formatPercentage(result.rates.costVariationRate)}
          </div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Beneficio USD</div>
          <div className="mt-2 text-3xl font-semibold">
            {formatCurrency(result.amounts.profitUsd)}
          </div>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="text-sm text-[color:var(--muted)]">Margen</div>
          <div className="mt-2 text-3xl font-semibold">
            {formatPercentage(result.rates.profitMarginRate)}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Tasas arancelarias por producto</h2>
          <p className="text-sm text-[color:var(--muted)]">
            Tabla informativa del padron cargado para consultar derechos, estadistica, IVA,
            impuesto interno y NCM de cada producto.
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[980px] text-sm">
            <thead className="text-left text-[color:var(--muted)]">
              <tr>
                {["Producto", "Derecho", "Estadistica", "IVA", "Imp. interno", "NCM"].map((header) => (
                  <th key={header} className="px-2 py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenario.productRules.map((rule) => (
                <tr
                  key={rule.productTypeKey}
                  className={`border-t border-[var(--line)] ${
                    rule.productTypeKey === scenario.productTypeKey ? "bg-slate-50" : ""
                  }`}
                >
                  <td className="px-2 py-2 font-medium">{rule.productTypeKey}</td>
                  <td className="px-2 py-2">{formatPercentage(rule.dutyRate)}</td>
                  <td className="px-2 py-2">{formatPercentage(rule.statisticsRate)}</td>
                  <td className="px-2 py-2">{formatPercentage(rule.vatRate)}</td>
                  <td className="px-2 py-2">{formatPercentage(rule.internalTaxRate)}</td>
                  <td className="px-2 py-2">{rule.ncmCode || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
