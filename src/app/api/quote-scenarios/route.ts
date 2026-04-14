import { NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { defaultQuoteScenario } from "@/modules/cotizador/defaults";
import { quoteScenarioFromRecord } from "@/modules/cotizador/mappers";
import { applyProtectedQuoteFields } from "@/modules/cotizador/guardrails";
import {
  quoteScenarioHistoryEntryFromRecord,
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

export async function POST(request: Request) {
  const user = await requireModuleAccess(ModuleKey.QUOTE);
  const parsed = quoteScenarioSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const [productRules, latestScenario] = await Promise.all([
    prisma.quoteProductRule.findMany({ orderBy: { productTypeKey: "asc" } }),
    user.role === "ADMIN"
      ? Promise.resolve(null)
      : prisma.quoteScenario.findFirst({
          where: { createdById: user.id },
          include: {
            items: { orderBy: { lineNumber: "asc" } },
            costLines: true
          },
          orderBy: { updatedAt: "desc" }
        })
  ]);

  const baselineScenario =
    latestScenario && productRules.length > 0
      ? quoteScenarioFromRecord({
          scenario: latestScenario,
          items: latestScenario.items,
          costLines: latestScenario.costLines,
          productRules
        })
      : {
          ...defaultQuoteScenario,
          productRules: productRules.length > 0 ? productRules : defaultQuoteScenario.productRules
        };

  const sanitizedInput = applyProtectedQuoteFields({
    input: {
      ...parsed.data,
      productRules:
        productRules.length > 0 ? productRules : defaultQuoteScenario.productRules
    },
    baseline: baselineScenario,
    canEditProtectedFields: user.role === "ADMIN"
  });

  const payload = quoteScenarioToCreatePayload(sanitizedInput);
  const created = await prisma.quoteScenario.create({
    data: {
      ...payload.scenario,
      createdById: user.id,
      items: { create: payload.items },
      costLines: { create: payload.costLines }
    }
  });

  const [savedScenario, refreshedRules] = await Promise.all([
    prisma.quoteScenario.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        items: { orderBy: { lineNumber: "asc" } },
        costLines: true
      }
    }),
    prisma.quoteProductRule.findMany({ orderBy: { productTypeKey: "asc" } })
  ]);

  await createAuditLog({
    actorUserId: user.id,
    entityType: "QUOTE_SCENARIO",
    entityId: created.id,
    action: "QUOTE_CREATED",
    payloadJson: {
      changedFields: [],
      scenarioName: savedScenario.name
    }
  });

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entityType: "QUOTE_SCENARIO",
      entityId: created.id
    },
    include: {
      actor: {
        select: { fullName: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    id: created.id,
    summary: quoteScenarioSummaryFromRecord({
      scenario: savedScenario,
      items: savedScenario.items
    }),
    detail: quoteScenarioHistoryEntryFromRecord({
      scenario: savedScenario,
      items: savedScenario.items,
      costLines: savedScenario.costLines,
      productRules: refreshedRules,
      auditLogs
    })
  });
}
