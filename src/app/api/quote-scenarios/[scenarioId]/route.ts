import { NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { applyProtectedQuoteFields, getChangedQuoteFields } from "@/modules/cotizador/guardrails";
import {
  quoteScenarioHistoryEntryFromRecord,
  quoteScenarioFromRecord,
  quoteScenarioSummaryFromRecord,
  quoteScenarioToCreatePayload
} from "@/modules/cotizador/mappers";

const quoteScenarioSchema = z.object({
  name: z.string().trim().min(1),
  productTypeKey: z.string().trim().min(1),
  supplierUnitPriceUsd: z.number(),
  priceFactor: z.number(),
  insuranceRate: z.number(),
  freightRatePerKgUsd: z.number(),
  freightWeightKg: z.number(),
  miscellaneousRate: z.number(),
  transferRate: z.number(),
  countryTaxRate: z.number(),
  exchangeRateArsUsd: z.number(),
  saleFactor: z.number(),
  productRules: z.array(z.any()),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ scenarioId: string }> }
) {
  const user = await requireModuleAccess(ModuleKey.QUOTE);
  const { scenarioId } = await params;
  const parsed = quoteScenarioSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const [productRules, existing] = await Promise.all([
    prisma.quoteProductRule.findMany({ orderBy: { productTypeKey: "asc" } }),
    prisma.quoteScenario.findFirst({
      where: { id: scenarioId, createdById: user.id },
      include: {
        items: { orderBy: { lineNumber: "asc" } },
        costLines: true
      }
    })
  ]);
  if (!existing) {
    return NextResponse.json({ error: "Escenario no encontrado" }, { status: 404 });
  }

  const previousScenario = quoteScenarioFromRecord({
    scenario: existing,
    items: existing.items,
    costLines: existing.costLines,
    productRules
  });
  const sanitizedInput = applyProtectedQuoteFields({
    input: {
      ...parsed.data,
      productRules
    },
    baseline: previousScenario,
    canEditProtectedFields: user.role === "ADMIN"
  });
  const changedFields = getChangedQuoteFields(previousScenario, sanitizedInput);
  const payload = quoteScenarioToCreatePayload(sanitizedInput);

  await prisma.$transaction([
    prisma.quoteItem.deleteMany({ where: { scenarioId } }),
    prisma.quoteCostProfile.deleteMany({ where: { scenarioId } }),
    prisma.quoteScenario.update({
      where: { id: scenarioId },
      data: {
        ...payload.scenario,
        items: { create: payload.items },
        costLines: { create: payload.costLines }
      }
    })
  ]);

  const savedScenario = await prisma.quoteScenario.findUniqueOrThrow({
    where: { id: scenarioId },
    include: {
      items: { orderBy: { lineNumber: "asc" } },
      costLines: true
    }
  });

  await createAuditLog({
    actorUserId: user.id,
    entityType: "QUOTE_SCENARIO",
    entityId: scenarioId,
    action: "QUOTE_UPDATED",
    payloadJson: {
      changedFields,
      scenarioName: savedScenario.name
    }
  });

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entityType: "QUOTE_SCENARIO",
      entityId: scenarioId
    },
    include: {
      actor: {
        select: { fullName: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    id: scenarioId,
    summary: quoteScenarioSummaryFromRecord({
      scenario: savedScenario,
      items: savedScenario.items
    }),
    detail: quoteScenarioHistoryEntryFromRecord({
      scenario: savedScenario,
      items: savedScenario.items,
      costLines: savedScenario.costLines,
      productRules,
      auditLogs
    })
  });
}
