"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Save } from "lucide-react";

import type { QuoteProductRule } from "@/modules/cotizador/domain/types";
import { formatPercentage, slugify, toNumber } from "@/lib/utils";

type EditableQuoteProductRule = QuoteProductRule & {
  localId: string;
};

function createEditableRules(rules: QuoteProductRule[]): EditableQuoteProductRule[] {
  return rules.map((rule) => ({
    ...rule,
    localId: slugify(rule.productTypeKey) || crypto.randomUUID()
  }));
}

function createEmptyRule(): EditableQuoteProductRule {
  return {
    localId: crypto.randomUUID(),
    productTypeKey: "",
    dutyRate: 0,
    statisticsRate: 0,
    vatRate: 0,
    advanceVatRate: 0,
    grossIncomeRate: 0,
    advanceIncomeTaxRate: 0,
    internalTaxRate: 0,
    ncmCode: "",
    description: ""
  };
}

export function TariffRulesManager({
  initialRules,
  canEdit
}: {
  initialRules: QuoteProductRule[];
  canEdit: boolean;
}) {
  const [rules, setRules] = useState(() => createEditableRules(initialRules));
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredRules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return rules;
    }

    return rules.filter((rule) =>
      [
        rule.productTypeKey,
        rule.ncmCode ?? "",
        rule.description ?? ""
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [query, rules]);

  function updateRule(
    localId: string,
    patch: Partial<EditableQuoteProductRule>
  ) {
    setRules((current) =>
      current.map((rule) => (rule.localId === localId ? { ...rule, ...patch } : rule))
    );
  }

  function addRule() {
    setRules((current) => [createEmptyRule(), ...current]);
  }

  function saveRules() {
    if (!canEdit) {
      setMessage("Solo el administrador puede modificar este modulo.");
      return;
    }

    startTransition(async () => {
      const payload = rules.map(({ localId, ...rule }) => ({
        ...rule,
        productTypeKey: rule.productTypeKey.trim(),
        ncmCode: rule.ncmCode?.trim() || null,
        description: rule.description?.trim() || null
      }));

      const response = await fetch("/api/quote-product-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: payload })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "No se pudieron guardar las tasas.");
        return;
      }

      setRules(createEditableRules(data.rules));
      setMessage("Tasas arancelarias actualizadas correctamente.");
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Cotizador
            </div>
            <h1 className="mt-2 text-3xl font-semibold">Tasas arancelarias</h1>
            <p className="mt-2 max-w-3xl text-sm text-[color:var(--muted)]">
              Este modulo alimenta al cotizador courier. Cualquier cambio guardado aca
              impacta en las tasas que usa la cotizacion.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cotizador"
              className="inline-flex rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-medium"
            >
              Volver al hub
            </Link>
            {canEdit ? (
              <>
                <button
                  onClick={addRule}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Agregar producto
                </button>
                <button
                  onClick={saveRules}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--brand)] px-4 py-3 font-medium text-white"
                >
                  <Save className="h-4 w-4" />
                  {isPending ? "Guardando..." : "Guardar tasas"}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            className="w-full max-w-md rounded-xl border border-[var(--line)] px-3 py-2"
            placeholder="Buscar por producto, NCM o descripcion"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="rounded-full border border-[var(--line)] px-3 py-1 text-sm">
            {canEdit ? "Edicion habilitada" : "Solo lectura"}
          </div>
        </div>

        {!canEdit ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Podes consultar este padron, pero la edicion esta bloqueada para usuarios no administradores.
          </div>
        ) : null}

        {message ? <div className="mt-4 text-sm text-[color:var(--brand)]">{message}</div> : null}
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="mb-4 text-sm text-[color:var(--muted)]">
          {filteredRules.length} productos visibles
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1480px] text-sm">
            <thead className="text-left text-[color:var(--muted)]">
              <tr>
                {[
                  "Producto",
                  "Derecho",
                  "Estadistica",
                  "IVA",
                  "AD IVA",
                  "IIBB",
                  "AD GAN",
                  "Imp. interno",
                  "NCM",
                  "Descripcion"
                ].map((header) => (
                  <th key={header} className="px-2 py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.localId} className="border-t border-[var(--line)]">
                  <td className="px-2 py-2">
                    <input
                      className="w-72 rounded-xl border border-[var(--line)] px-3 py-2"
                      value={rule.productTypeKey}
                      disabled={!canEdit}
                      onChange={(event) =>
                        updateRule(rule.localId, { productTypeKey: event.target.value })
                      }
                    />
                  </td>
                  {[
                    "dutyRate",
                    "statisticsRate",
                    "vatRate",
                    "advanceVatRate",
                    "grossIncomeRate",
                    "advanceIncomeTaxRate",
                    "internalTaxRate"
                  ].map((field) => (
                    <td key={field} className="px-2 py-2">
                      <input
                        className="w-28 rounded-xl border border-[var(--line)] px-3 py-2"
                        type="number"
                        step="0.0001"
                        value={rule[field as keyof QuoteProductRule] as number}
                        disabled={!canEdit}
                        onChange={(event) =>
                          updateRule(rule.localId, {
                            [field]: toNumber(event.target.value)
                          } as Partial<EditableQuoteProductRule>)
                        }
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <input
                      className="w-40 rounded-xl border border-[var(--line)] px-3 py-2"
                      value={rule.ncmCode ?? ""}
                      disabled={!canEdit}
                      onChange={(event) =>
                        updateRule(rule.localId, { ncmCode: event.target.value })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className="w-72 rounded-xl border border-[var(--line)] px-3 py-2"
                      value={rule.description ?? ""}
                      disabled={!canEdit}
                      onChange={(event) =>
                        updateRule(rule.localId, { description: event.target.value })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Vista rapida de tasas</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {filteredRules.slice(0, 8).map((rule) => (
            <div key={`${rule.localId}-summary`} className="rounded-2xl border border-[var(--line)] p-4">
              <div className="font-medium">{rule.productTypeKey || "Nuevo producto"}</div>
              <div className="mt-3 space-y-1 text-sm text-[color:var(--muted)]">
                <div>Derecho: {formatPercentage(rule.dutyRate)}</div>
                <div>Estadistica: {formatPercentage(rule.statisticsRate)}</div>
                <div>IVA: {formatPercentage(rule.vatRate)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
