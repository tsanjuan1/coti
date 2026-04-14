"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Eye, RefreshCcw, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { PercentageInput } from "@/components/inputs/percentage-input";
import { calculateQuoteScenario } from "@/modules/cotizador/domain/calculate-quote";
import type {
  QuoteScenarioHistoryEntry,
  QuoteScenarioInput,
  QuoteScenarioSummary
} from "@/modules/cotizador/domain/types";
import { formatCurrency, formatPercentage, toNumber } from "@/lib/utils";

export function QuoteEditor({
  initialScenario,
  scenarioId,
  initialSavedScenarios,
  initialHistoryEntries,
  canEditProtectedFields
}: {
  initialScenario: QuoteScenarioInput;
  scenarioId?: string;
  initialSavedScenarios: QuoteScenarioSummary[];
  initialHistoryEntries: QuoteScenarioHistoryEntry[];
  canEditProtectedFields: boolean;
}) {
  const router = useRouter();
  const [scenario, setScenario] = useState(initialScenario);
  const [persistedScenarioId, setPersistedScenarioId] = useState(scenarioId);
  const [savedScenarios, setSavedScenarios] = useState(initialSavedScenarios);
  const [historyEntries, setHistoryEntries] = useState(initialHistoryEntries);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const result = useMemo(() => calculateQuoteScenario(scenario), [scenario]);
  const selectedHistoryEntry =
    historyEntries.find((entry) => entry.id === selectedHistoryId) ?? null;

  useEffect(() => {
    setScenario(initialScenario);
  }, [initialScenario]);

  useEffect(() => {
    setPersistedScenarioId(scenarioId);
  }, [scenarioId]);

  useEffect(() => {
    setSavedScenarios(initialSavedScenarios);
  }, [initialSavedScenarios]);

  useEffect(() => {
    setHistoryEntries(initialHistoryEntries);
  }, [initialHistoryEntries]);

  function saveScenario(mode: "create" | "update") {
    startTransition(async () => {
      const isUpdate = mode === "update" && persistedScenarioId;
      const response = await fetch(isUpdate ? `/api/quote-scenarios/${persistedScenarioId}` : "/api/quote-scenarios", {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario)
      });

      const payload = await response
        .json()
        .catch(() => ({
          error: "No se pudo guardar.",
          id: undefined as string | undefined,
          detail: undefined as QuoteScenarioHistoryEntry | undefined
        }));

      if (!response.ok) {
        setMessage(payload.error ?? "No se pudo guardar.");
        return;
      }

      if (payload.id) {
        setPersistedScenarioId(payload.id);
      }

      if (payload.summary) {
        setSavedScenarios((current) => {
          const next = current.filter((entry) => entry.id !== payload.summary.id);
          return [payload.summary, ...next];
        });
      }

      if (payload.detail) {
        setHistoryEntries((current) => {
          const next = current.filter((entry) => entry.id !== payload.detail.id);
          return [payload.detail, ...next];
        });
        setSelectedHistoryId(payload.detail.id);
      }

      if (!isUpdate && payload.id) {
        router.replace(`/cotizador/courier?scenarioId=${payload.id}`);
      }

      router.refresh();
      setMessage(
        isUpdate
          ? "Cotizacion actualizada correctamente."
          : "Nueva cotizacion guardada y registrada en el historial."
      );
    });
  }

  const breakdownRows = [
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
  ] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Courier
            </div>
            <h1 className="mt-2 text-3xl font-semibold">Cotizador compacto</h1>
            <p className="mt-2 max-w-3xl text-sm text-[color:var(--muted)]">
              Esta version sigue la variante compacta del Excel: producto, costo proveedor,
              seguro, flete por kilo, tasas del padron y salida en USD/ARS.
            </p>
            {!canEditProtectedFields ? (
              <p className="mt-2 max-w-3xl text-sm text-amber-700">
                En tu perfil, los campos de seguro, flete, gastos varios, transferencia e imp.
                pais quedan bloqueados y solo puede modificarlos un administrador.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cotizador"
              className="inline-flex items-center rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-medium"
            >
              Volver al hub
            </Link>
            <Link
              href="/cotizador/tasas-arancelarias"
              className="inline-flex items-center rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-medium"
            >
              Tasas arancelarias
            </Link>
            <button
              onClick={() => saveScenario("create")}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--brand)] px-4 py-3 font-medium text-white"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Guardando..." : "Guardar nueva cotizacion"}
            </button>
            {persistedScenarioId ? (
              <button
                onClick={() => saveScenario("update")}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-medium"
              >
                <RefreshCcw className="h-4 w-4" />
                {isPending ? "Actualizando..." : "Actualizar actual"}
              </button>
            ) : null}
          </div>
        </div>
        {message ? <div className="mt-4 text-sm text-[color:var(--brand)]">{message}</div> : null}
        <div className="mt-3 text-xs text-[color:var(--muted)]">
          Guardar nueva cotizacion crea un registro adicional en la base. Actualizar actual
          solo modifica la cotizacion abierta.
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Historial de cotizaciones guardadas</h2>
            <p className="text-sm text-[color:var(--muted)]">
              Cada guardado queda registrado aca. Podes volver a abrir cualquier escenario.
            </p>
          </div>
          <div className="rounded-full border border-[var(--line)] px-3 py-1 text-sm">
            {savedScenarios.length} guardadas
          </div>
        </div>

        {savedScenarios.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--line)] px-4 py-6 text-sm text-[color:var(--muted)]">
            Todavia no hay cotizaciones registradas para este usuario.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {savedScenarios.map((savedScenario) => {
              const active = savedScenario.id === persistedScenarioId;
              const historyEntry =
                historyEntries.find((entry) => entry.id === savedScenario.id) ?? null;
              const modificationCount =
                historyEntry?.modificationLog.filter((entry) => entry.action === "QUOTE_UPDATED")
                  .length ?? 0;
              return (
                <div
                  key={savedScenario.id}
                  className={`rounded-2xl border p-4 transition ${
                    active
                      ? "border-[color:var(--brand)] bg-slate-50"
                      : "border-[var(--line)] bg-white hover:-translate-y-0.5"
                  }`}
                >
                  <div className="text-sm text-[color:var(--muted)]">
                    {new Date(savedScenario.updatedAt).toLocaleString("es-AR")}
                  </div>
                  <div className="mt-2 text-lg font-semibold">{savedScenario.name}</div>
                  <div className="mt-2 text-sm text-[color:var(--muted)]">
                    {savedScenario.productTypeKey}
                  </div>
                  <div className="mt-3 text-sm font-medium">
                    {formatCurrency(savedScenario.supplierUnitPriceUsd)}
                  </div>
                  <div className="mt-2 text-xs text-[color:var(--muted)]">
                    {modificationCount > 0
                      ? `${modificationCount} modificaciones registradas`
                      : "Sin modificaciones registradas"}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        setSelectedHistoryId(savedScenario.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      Ver detalle
                    </button>
                    <Link
                      href={`/cotizador/courier?scenarioId=${savedScenario.id}`}
                      className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-2 text-sm"
                    >
                      Abrir
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
              <PercentageInput
                className="mt-2"
                value={scenario.insuranceRate}
                disabled={!canEditProtectedFields}
                onValueChange={(insuranceRate) => setScenario({ ...scenario, insuranceRate })}
              />
            </label>

            <label>
              <span className="text-sm font-medium">Costo flete x kg</span>
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                type="number"
                step="0.01"
                value={scenario.freightRatePerKgUsd}
                disabled={!canEditProtectedFields}
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
              <PercentageInput
                className="mt-2"
                value={scenario.miscellaneousRate}
                disabled={!canEditProtectedFields}
                onValueChange={(miscellaneousRate) =>
                  setScenario({ ...scenario, miscellaneousRate })
                }
              />
            </label>

            <label>
              <span className="text-sm font-medium">Transferencia</span>
              <PercentageInput
                className="mt-2"
                value={scenario.transferRate}
                disabled={!canEditProtectedFields}
                onValueChange={(transferRate) => setScenario({ ...scenario, transferRate })}
              />
            </label>

            <label>
              <span className="text-sm font-medium">Imp. pais</span>
              <PercentageInput
                className="mt-2"
                value={scenario.countryTaxRate}
                disabled={!canEditProtectedFields}
                onValueChange={(countryTaxRate) => setScenario({ ...scenario, countryTaxRate })}
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
              {breakdownRows.map(([label, rate, usd, ars]) => (
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

      {selectedHistoryEntry ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Detalle guardado
                </div>
                <h2 className="mt-2 text-2xl font-semibold">
                  {selectedHistoryEntry.summary.name}
                </h2>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {selectedHistoryEntry.summary.productTypeKey} - guardada el{" "}
                  {new Date(selectedHistoryEntry.summary.updatedAt).toLocaleString("es-AR")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryId(null)}
                className="rounded-2xl border border-[var(--line)] p-3"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-[var(--line)] p-4">
                <div className="text-sm text-[color:var(--muted)]">Proveedor</div>
                <div className="mt-2 text-2xl font-semibold">
                  {formatCurrency(selectedHistoryEntry.scenario.supplierUnitPriceUsd)}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] p-4">
                <div className="text-sm text-[color:var(--muted)]">Costo total</div>
                <div className="mt-2 text-2xl font-semibold">
                  {formatCurrency(selectedHistoryEntry.result.amounts.totalCostUsd)}
                </div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">
                  {formatCurrency(selectedHistoryEntry.result.amounts.totalCostArs, "ARS")}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] p-4">
                <div className="text-sm text-[color:var(--muted)]">Factura courier</div>
                <div className="mt-2 text-2xl font-semibold">
                  {formatCurrency(selectedHistoryEntry.result.amounts.courierInvoiceUsd)}
                </div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">
                  {formatCurrency(selectedHistoryEntry.result.amounts.courierInvoiceArs, "ARS")}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] p-4">
                <div className="text-sm text-[color:var(--muted)]">Venta</div>
                <div className="mt-2 text-2xl font-semibold">
                  {formatCurrency(selectedHistoryEntry.result.amounts.salePriceUsd)}
                </div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">
                  {formatCurrency(selectedHistoryEntry.result.amounts.salePriceArs, "ARS")}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1.3fr]">
              <div className="rounded-[24px] border border-[var(--line)] p-5">
                <h3 className="text-lg font-semibold">Inputs usados</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>Producto</span>
                    <strong>{selectedHistoryEntry.scenario.productTypeKey}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Precio</span>
                    <strong>{selectedHistoryEntry.scenario.priceFactor}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Seguro</span>
                    <strong>{formatPercentage(selectedHistoryEntry.scenario.insuranceRate)}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Flete x kg</span>
                    <strong>{formatCurrency(selectedHistoryEntry.scenario.freightRatePerKgUsd)}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Peso facturable</span>
                    <strong>{selectedHistoryEntry.scenario.freightWeightKg}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Gastos varios</span>
                    <strong>{formatPercentage(selectedHistoryEntry.scenario.miscellaneousRate)}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Transferencia</span>
                    <strong>{formatPercentage(selectedHistoryEntry.scenario.transferRate)}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Imp. pais</span>
                    <strong>{formatPercentage(selectedHistoryEntry.scenario.countryTaxRate)}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>TC</span>
                    <strong>{selectedHistoryEntry.scenario.exchangeRateArsUsd}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Venta</span>
                    <strong>{selectedHistoryEntry.scenario.saleFactor}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>NCM aplicado</span>
                    <strong>{selectedHistoryEntry.result.selectedRule?.ncmCode || "-"}</strong>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--line)] p-5">
                <h3 className="text-lg font-semibold">Gastos de la cotizacion</h3>
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
                        ["Precio ajustado", formatPercentage(selectedHistoryEntry.result.rates.priceFactor - 1), selectedHistoryEntry.result.amounts.adjustedSupplierPriceUsd, selectedHistoryEntry.result.amounts.adjustedSupplierPriceUsd * selectedHistoryEntry.scenario.exchangeRateArsUsd],
                        ["Seguro", formatPercentage(selectedHistoryEntry.scenario.insuranceRate), selectedHistoryEntry.result.amounts.insuranceUsd, selectedHistoryEntry.result.amounts.insuranceUsd * selectedHistoryEntry.scenario.exchangeRateArsUsd],
                        ["Flete", "-", selectedHistoryEntry.result.amounts.freightUsd, selectedHistoryEntry.result.amounts.freightUsd * selectedHistoryEntry.scenario.exchangeRateArsUsd],
                        ["Derechos", formatPercentage(selectedHistoryEntry.result.rates.dutyRate), selectedHistoryEntry.result.amounts.dutiesUsd, selectedHistoryEntry.result.amounts.dutiesUsd * selectedHistoryEntry.scenario.exchangeRateArsUsd],
                        ["Estadistica", formatPercentage(selectedHistoryEntry.result.rates.statisticsRate), selectedHistoryEntry.result.amounts.statisticsUsd, selectedHistoryEntry.result.amounts.statisticsUsd * selectedHistoryEntry.scenario.exchangeRateArsUsd],
                        ["IVA", formatPercentage(selectedHistoryEntry.result.rates.vatRate), selectedHistoryEntry.result.amounts.vatUsd, selectedHistoryEntry.result.amounts.vatUsd * selectedHistoryEntry.scenario.exchangeRateArsUsd],
                        ["Imp. interno", formatPercentage(selectedHistoryEntry.result.rates.internalTaxRate), selectedHistoryEntry.result.amounts.internalTaxUsd, selectedHistoryEntry.result.amounts.internalTaxUsd * selectedHistoryEntry.scenario.exchangeRateArsUsd],
                        ["Gastos varios", formatPercentage(selectedHistoryEntry.result.rates.miscellaneousRate), selectedHistoryEntry.result.amounts.miscellaneousUsd, selectedHistoryEntry.result.amounts.miscellaneousUsd * selectedHistoryEntry.scenario.exchangeRateArsUsd],
                        ["Transferencia", formatPercentage(selectedHistoryEntry.result.rates.transferRate), selectedHistoryEntry.result.amounts.transferUsd, selectedHistoryEntry.result.amounts.transferUsd * selectedHistoryEntry.scenario.exchangeRateArsUsd],
                        ["Imp. pais", formatPercentage(selectedHistoryEntry.result.rates.countryTaxRate), selectedHistoryEntry.result.amounts.countryTaxUsd, selectedHistoryEntry.result.amounts.countryTaxUsd * selectedHistoryEntry.scenario.exchangeRateArsUsd]
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
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-[var(--line)] p-5">
              <h3 className="text-lg font-semibold">Historial de modificaciones</h3>
              {selectedHistoryEntry.modificationLog.length === 0 ? (
                <div className="mt-4 text-sm text-[color:var(--muted)]">
                  No hay movimientos registrados para esta cotizacion.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {selectedHistoryEntry.modificationLog.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-[var(--line)] bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div className="font-medium">
                          {log.action === "QUOTE_CREATED"
                            ? "Creacion de la cotizacion"
                            : "Actualizacion de la cotizacion"}
                        </div>
                        <div className="text-sm text-[color:var(--muted)]">
                          {new Date(log.createdAt).toLocaleString("es-AR")}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-[color:var(--muted)]">
                        Usuario: {log.actorName}
                      </div>
                      {log.changedFields.length > 0 ? (
                        <div className="mt-2 text-sm">
                          Campos modificados: {log.changedFields.join(", ")}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
