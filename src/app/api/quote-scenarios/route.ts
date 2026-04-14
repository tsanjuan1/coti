import { NextResponse } from "next/server";
import { ModuleKey } from "@prisma/client";
import { z } from "zod";

import { requireModuleAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
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

  const payload = quoteScenarioToCreatePayload(parsed.data);
  const created = await prisma.quoteScenario.create({
    data: {
      ...payload.scenario,
      createdById: user.id,
      items: { create: payload.items },
      costLines: { create: payload.costLines }
    }
  });

  const [savedScenario, productRules] = await Promise.all([
    prisma.quoteScenario.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        items: { orderBy: { lineNumber: "asc" } },
        costLines: true
      }
    }),
    prisma.quoteProductRule.findMany({ orderBy: { productTypeKey: "asc" } })
  ]);

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
      productRules
    })
  });
}
