import { Prisma } from "@prisma/client";
import type { AuditLog, QuoteCostProfile, QuoteItem, QuoteScenario } from "@prisma/client";

import { defaultQuoteScenario } from "@/modules/cotizador/defaults";
import { calculateQuoteScenario } from "@/modules/cotizador/domain/calculate-quote";
import type {
  QuoteModificationLogEntry,
  QuoteScenarioHistoryEntry,
  QuoteProductRule,
  QuoteScenarioInput,
  QuoteScenarioSummary
} from "@/modules/cotizador/domain/types";

const compactCostLineDefaults = {
  freightRatePerKgUsd: defaultQuoteScenario.freightRatePerKgUsd,
  miscellaneousRate: defaultQuoteScenario.miscellaneousRate,
  transferRate: defaultQuoteScenario.transferRate,
  exchangeRateArsUsd: defaultQuoteScenario.exchangeRateArsUsd
};

function readCompactCostLine(
  costLines: QuoteCostProfile[],
  lineKey: keyof typeof compactCostLineDefaults
) {
  const costLine = costLines.find(
    (entry) => entry.section === "compact" && entry.lineKey === lineKey
  );

  if (!costLine) {
    return compactCostLineDefaults[lineKey];
  }

  return (costLine.mode === "rate" ? costLine.rate : costLine.amount) ?? compactCostLineDefaults[lineKey];
}

function readSnapshotMetadata<T>(costLines: QuoteCostProfile[], lineKey: string) {
  const costLine = costLines.find(
    (entry) => entry.section === "snapshot" && entry.lineKey === lineKey
  );

  if (!costLine?.metadataJson || typeof costLine.metadataJson !== "object") {
    return null;
  }

  return costLine.metadataJson as T;
}

function toJsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function readChangedFieldsFromPayload(payloadJson: unknown) {
  if (!payloadJson || typeof payloadJson !== "object") {
    return [];
  }

  const value = (payloadJson as { changedFields?: unknown }).changedFields;
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

export function quoteScenarioFromRecord(args: {
  scenario: QuoteScenario;
  items: QuoteItem[];
  costLines: QuoteCostProfile[];
  productRules: QuoteProductRule[];
}): QuoteScenarioInput {
  const fallback = structuredClone(defaultQuoteScenario);
  const primaryItem = args.items[0];

  return {
    ...fallback,
    name: args.scenario.name,
    productTypeKey: primaryItem?.productTypeKey ?? fallback.productTypeKey,
    supplierUnitPriceUsd: primaryItem?.fobUnitCost ?? fallback.supplierUnitPriceUsd,
    priceFactor: args.scenario.globalMarkupFactor,
    insuranceRate: args.scenario.insuranceRate,
    freightRatePerKgUsd: readCompactCostLine(args.costLines, "freightRatePerKgUsd"),
    freightWeightKg: primaryItem?.weightKg ?? fallback.freightWeightKg,
    miscellaneousRate: readCompactCostLine(args.costLines, "miscellaneousRate"),
    transferRate: readCompactCostLine(args.costLines, "transferRate"),
    countryTaxRate: args.scenario.countryTaxRate,
    exchangeRateArsUsd: readCompactCostLine(args.costLines, "exchangeRateArsUsd"),
    saleFactor: primaryItem?.lineMarkup ?? fallback.saleFactor,
    productRules: args.productRules
  };
}

export function quoteScenarioToCreatePayload(input: QuoteScenarioInput) {
  const result = calculateQuoteScenario(input);
  const costLines = [
    {
      section: "compact",
      lineKey: "freightRatePerKgUsd",
      label: "Costo flete x kg",
      mode: "amount",
      amount: input.freightRatePerKgUsd,
      rate: 0
    },
    {
      section: "compact",
      lineKey: "miscellaneousRate",
      label: "Gastos varios",
      mode: "rate",
      amount: 0,
      rate: input.miscellaneousRate
    },
    {
      section: "compact",
      lineKey: "transferRate",
      label: "Transferencia",
      mode: "rate",
      amount: 0,
      rate: input.transferRate
    },
    {
      section: "compact",
      lineKey: "exchangeRateArsUsd",
      label: "TC",
      mode: "amount",
      amount: input.exchangeRateArsUsd,
      rate: 0
    },
    {
      section: "snapshot",
      lineKey: "calculationResult",
      label: "Resultado de la cotizacion",
      mode: "metadata",
      amount: 0,
      rate: 0,
      metadataJson: toJsonValue(result)
    }
  ];

  if (result.selectedRule) {
    costLines.push({
      section: "snapshot",
      lineKey: "selectedRule",
      label: "Regla arancelaria aplicada",
      mode: "metadata",
      amount: 0,
      rate: 0,
      metadataJson: toJsonValue(result.selectedRule)
    });
  }

  return {
    scenario: {
      name: input.name,
      globalMarkupFactor: input.priceFactor,
      insuranceRate: input.insuranceRate,
      advanceVatEnabled: false,
      countryTaxRate: input.countryTaxRate
    },
    items: [
      {
        lineNumber: 1,
        status: "COTIZACION" as const,
        quoteDate: null,
        sellerName: null,
        quantity: 1,
        partNumber: "",
        description: input.productTypeKey,
        productTypeKey: input.productTypeKey,
        fobUnitCost: input.supplierUnitPriceUsd,
        weightKg: input.freightWeightKg,
        lineMarkup: input.saleFactor
      }
    ],
    costLines
  };
}

export function quoteScenarioSummaryFromRecord(args: {
  scenario: QuoteScenario;
  items: QuoteItem[];
}): QuoteScenarioSummary {
  const primaryItem = args.items[0];

  return {
    id: args.scenario.id,
    name: args.scenario.name,
    productTypeKey: primaryItem?.productTypeKey ?? defaultQuoteScenario.productTypeKey,
    supplierUnitPriceUsd: primaryItem?.fobUnitCost ?? defaultQuoteScenario.supplierUnitPriceUsd,
    updatedAt: args.scenario.updatedAt.toISOString()
  };
}

export function quoteScenarioHistoryEntryFromRecord(args: {
  scenario: QuoteScenario;
  items: QuoteItem[];
  costLines: QuoteCostProfile[];
  productRules: QuoteProductRule[];
  auditLogs?: Array<AuditLog & { actor: { fullName: string } | null }>;
}): QuoteScenarioHistoryEntry {
  const scenario = quoteScenarioFromRecord({
    scenario: args.scenario,
    items: args.items,
    costLines: args.costLines,
    productRules: args.productRules
  });
  const summary = quoteScenarioSummaryFromRecord({
    scenario: args.scenario,
    items: args.items
  });
  const storedResult =
    readSnapshotMetadata<QuoteScenarioHistoryEntry["result"]>(
      args.costLines,
      "calculationResult"
    ) ?? calculateQuoteScenario(scenario);

  return {
    id: args.scenario.id,
    summary,
    scenario,
    result: storedResult,
    modificationLog: (args.auditLogs ?? []).map(
      (log): QuoteModificationLogEntry => ({
        id: log.id,
        action: log.action,
        actorName: log.actor?.fullName ?? "Sistema",
        createdAt: log.createdAt.toISOString(),
        changedFields: readChangedFieldsFromPayload(log.payloadJson)
      })
    )
  };
}
